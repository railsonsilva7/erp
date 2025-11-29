from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import requests
import uuid

import models
import schemas
from database import SessionLocal, engine
from config import settings

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "ERP API is running"}

@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

from fiscal import fiscal_client
from pydantic import BaseModel

class SalePayload(BaseModel):
    id: str
    date: str
    items: List[dict]
    total: float

@app.post("/fiscal/emit")
def emit_fiscal_document(sale: SalePayload):
    try:
        result = fiscal_client.emit_nfe(sale.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/settings/company", response_model=schemas.CompanySettings)
def read_company_settings(db: Session = Depends(get_db)):
    settings = db.query(models.CompanySettings).first()
    if not settings:
        # Return empty/default if not found, or raise 404. 
        # For simplicity, let's return a default structure or handle it in frontend.
        # Better: raise 404 and let frontend handle "create new".
        raise HTTPException(status_code=404, detail="Company settings not found")
    return settings

@app.post("/settings/company", response_model=schemas.CompanySettings)
def create_or_update_company_settings(settings: schemas.CompanySettingsCreate, db: Session = Depends(get_db)):
    db_settings = db.query(models.CompanySettings).first()
    if db_settings:
        # Update existing
        for key, value in settings.model_dump().items():
            setattr(db_settings, key, value)
    else:
        # Create new
        db_settings = models.CompanySettings(**settings.model_dump())
        db.add(db_settings)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

@app.post("/sales")
def process_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    # Validate stock first
    for item in sale.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")
    
    # Deduct stock
    for item in sale.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        product.quantity -= item.quantity
    
    db.commit()
    return {"message": "Sale processed and stock updated"}

# Strict schema for manual invoice - MUST match frontend exactly
class ManualInvoiceSchema(BaseModel):
    # Dados do Cliente (Exatamente como vem do React)
    cpf_cnpj: str
    nome: str
    logradouro: str
    numero: str
    bairro: str
    municipio: str
    uf: str
    cep: str
    # Novos campos para PJ (opcionais, mas enviados se preenchidos)
    inscricao_estadual: str = ""
    indicador_inscricao_estadual: str = "9"  # Default: Não Contribuinte
    email: str = ""
    telefone: str = ""
    codigo_municipio: str = ""
    codigo_pais: Optional[str] = "1058"  # Brasil
    pais: Optional[str] = "BRASIL"
    
    # Override de numeração (Opcional)
    numero_nfe: Optional[str] = None
    
    # Dados do Item
    item_nome: str
    item_ncm: str
    item_cfop: str
    item_price: float
    item_quantity: int

# Helper function to build destinatario with correct CPF/CNPJ key
def _build_destinatario(body: ManualInvoiceSchema):
    """
    Constrói o objeto destinatário com a chave correta (cpf ou cnpj)
    e todos os campos fiscais necessários
    """
    cpf_cnpj_clean = "".join(filter(str.isdigit, body.cpf_cnpj))
    
    # Usar código do município fornecido pelo usuário, senão fallback para Florianópolis
    codigo_municipio = body.codigo_municipio if body.codigo_municipio else "4205407"
    
    # REGRA CRÍTICA: Se tem inscrição estadual, o indicador deve ser 1 ou 2, nunca 9
    indicador_ie = body.indicador_inscricao_estadual
    if body.inscricao_estadual and indicador_ie == "9":
        # Se tem IE mas marcou como "não contribuinte", forçar para "1" (contribuinte)
        indicador_ie = "1"
    
    destinatario = {
        "nome": body.nome,
        "logradouro": body.logradouro,
        "numero": body.numero,
        "bairro": body.bairro,
        "municipio": body.municipio,
        "codigo_municipio": codigo_municipio,
        "uf": body.uf,
        "cep": body.cep,
        "pais": body.pais,
        "codigo_pais": body.codigo_pais,
        "indicador_inscricao_estadual": indicador_ie
    }
    
    # Adicionar campos opcionais apenas se preenchidos
    if body.inscricao_estadual:
        destinatario["inscricao_estadual"] = body.inscricao_estadual
    
    if body.email:
        destinatario["email"] = body.email
    
    if body.telefone:
        destinatario["telefone"] = body.telefone
    
    # Se tem mais de 11 dígitos, é CNPJ, senão é CPF
    if len(cpf_cnpj_clean) > 11:
        destinatario["cnpj"] = cpf_cnpj_clean
    else:
        destinatario["cpf"] = cpf_cnpj_clean
    
    return destinatario

@app.post("/fiscal/issue-manual")
def issue_manual_invoice(body: ManualInvoiceSchema):
    import json
    from datetime import datetime
    
    # DEBUG CRITICAL: Show what Python received
    print('=' * 80)
    print(f"DEBUG PYTHON RECEBEU: {body.model_dump()}")
    print('=' * 80)
    
    # Sanitize CPF/CNPJ (Remove formatting)
    body.cpf_cnpj = "".join(filter(str.isdigit, body.cpf_cnpj))
    
    try:
        # Get company CNPJ
        db = SessionLocal()
        company = db.query(models.CompanySettings).first()
        db.close()
        
        cnpj_emitente = company.cnpj if company else settings.FOCUS_NFE_CNPJ
        cnpj_emitente = "".join(filter(str.isdigit, cnpj_emitente)) if cnpj_emitente else ""
        uf_emitente = company.uf if company and company.uf else "SC" # Fallback to SC if missing
        
        print(f"🏢 CNPJ EMITENTE: {cnpj_emitente} | UF: {uf_emitente}")
        
        # Determine Local Destino (1=Internal, 2=Interstate, 3=International)
        uf_destinatario = body.uf.upper().strip()
        local_destino = 1 if uf_emitente.upper().strip() == uf_destinatario else 2
        
        # Auto-adjust CFOP for Interstate
        item_cfop = body.item_cfop
        if local_destino == 2 and item_cfop.startswith('5'):
            item_cfop = '6' + item_cfop[1:]
            print(f"🔄 CFOP Ajustado para Interestadual: {body.item_cfop} -> {item_cfop}")
        
        # Generate clean reference ID for URL param
        ref_id = uuid.uuid4().hex
        
        # BUILD PAYLOAD MANUALLY - SEM HELPERS
        # CRÍTICO: Montar o destinatario EXATAMENTE como a API espera
        payload = {
            "natureza_operacao": "Venda de Mercadoria",
            "data_emissao": datetime.now().isoformat(),
            "tipo_documento": 1,
            "local_destino": local_destino,
            "finalidade_emissao": 1,
            "consumidor_final": 1 if body.indicador_inscricao_estadual == "9" else 0,  # 1 for consumer final when not contributor
            "presenca_comprador": 1,
            "modalidade_frete": 9,
            "cnpj_emitente": cnpj_emitente,  # OBRIGATÓRIO: CNPJ da empresa emitente
            # Se o usuário informou um número manual, usa ele
            **({"numero": body.numero_nfe} if body.numero_nfe else {}),
            # DESTINATARIO FLATTENED (Raiz do Payload)
            # A API exige campos planos com sufixo _destinatario
            "nome_destinatario": body.nome,
            "logradouro_destinatario": body.logradouro,
            "numero_destinatario": body.numero,
            "bairro_destinatario": body.bairro,
            "municipio_destinatario": body.municipio,
            "uf_destinatario": body.uf,
            "cep_destinatario": body.cep,
            "telefone_destinatario": body.telefone if body.telefone else "",
            "indicador_inscricao_estadual_destinatario": body.indicador_inscricao_estadual,
            "inscricao_estadual_destinatario": body.inscricao_estadual if body.inscricao_estadual else "",
            "codigo_municipio_destinatario": body.codigo_municipio if body.codigo_municipio else "4205407",
            # Campos de país (opcionais/padrão)
            #"pais_destinatario": "BRASIL", 
            #"codigo_pais_destinatario": "1058",
            
            # CPF/CNPJ Dinâmico
            ("cnpj_destinatario" if len(body.cpf_cnpj) > 11 else "cpf_destinatario"): body.cpf_cnpj,
            "itens": [
                {
                    "numero_item": 1,
                    "codigo_produto": "ITEM01",
                    "descricao": body.item_nome,
                    "codigo_ncm": body.item_ncm,
                    "cfop": item_cfop, # FIXED: Use adjusted CFOP
                    "unidade_comercial": "un",
                    "quantidade_comercial": body.item_quantity,
                    "valor_unitario_comercial": body.item_price,
                    "unidade_tributavel": "un",
                    "quantidade_tributavel": body.item_quantity,
                    "valor_unitario_tributavel": body.item_price,
                    "icms_origem": "0",
                    "icms_situacao_tributaria": "102",
                    # PIS e COFINS (Obrigatórios mesmo para Simples Nacional em alguns casos)
                    "pis_situacao_tributaria": "99",
                    "pis_valor_base": 0.00,
                    "pis_aliquota": 0.00,
                    "pis_valor": 0.00,
                    "cofins_situacao_tributaria": "99",
                    "cofins_valor_base": 0.00,
                    "cofins_aliquota": 0.00,
                    "cofins_valor": 0.00
                }
            ]
        }
        
        # DEBUG VISUAL - MOSTRAR JSON COMPLETO
        print('=' * 80)
        print('📦 PAYLOAD COMPLETO QUE SERÁ ENVIADO:')
        print('=' * 80)
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        print('=' * 80)
        print('=' * 80)
        
        # FIXED: Use production URL (company is registered in Production Trial)
        # The "homologação" series in company settings ensures test mode
        base_url = "https://api.focusnfe.com.br/v2"
        url = f"{base_url}/nfe?ref={ref_id}"
        
        print(f"URL DE ENVIO (PRODUCTION): {url}")
        print('=' * 80)
        
        # Save invoice to database for webhook tracking
        db_invoice = models.ManualInvoice(
            ref=ref_id,
            status="processando",
            created_at=datetime.now().isoformat(),
            recipient_name=body.nome,
            total_value=body.item_price * body.item_quantity
        )
        db = SessionLocal()
        db.add(db_invoice)
        db.commit()
        db.close()
        
        # Send to Focus NFe
        response = requests.post(url, json=payload, auth=(settings.FOCUS_NFE_TOKEN, ""))
        
        print(f"RESPONSE STATUS CODE: {response.status_code}")
        print(f"RESPONSE COMPLETA:")
        print(response.text)
        print('=' * 80)
        
        if response.status_code in [401, 403]:
            raise HTTPException(status_code=401, detail="Erro de autenticação com Focus NFe")
        
        try:
            result = response.json()
            print(f"RESPONSE JSON PARSED:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            print('=' * 80)
            
            # Persist to Financial Invoice Table
            # We save it regardless of status (authorized or processing) to track it
            db = SessionLocal()
            
            # Check if already exists (should not, as ref is new)
            existing = db.query(models.Invoice).filter(models.Invoice.ref == ref_id).first()
            
            if not existing:
                new_invoice = models.Invoice(
                    ref=ref_id,
                    status=result.get('status'),
                    number=result.get('numero'),
                    series=result.get('serie'),
                    access_key=result.get('chave_nfe'),
                    pdf_url=f"https://api.focusnfe.com.br{result.get('caminho_danfe')}" if result.get('caminho_danfe') else None,
                    xml_url=f"https://api.focusnfe.com.br{result.get('caminho_xml_nota_fiscal')}" if result.get('caminho_xml_nota_fiscal') else None,
                    issued_at=datetime.now().isoformat(),
                    recipient_name=body.nome,
                    total_value=body.item_price * body.item_quantity
                )
                db.add(new_invoice)
                db.commit()
            db.close()
            
            return result
        except:
            if response.status_code >= 400:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            return {"raw_response": response.text}
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO INESPERADO: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- FINANCIAL MODULE ROUTES ---

@app.get("/invoices")
def list_invoices():
    db = SessionLocal()
    try:
        # Return most recent first
        invoices = db.query(models.Invoice).order_by(models.Invoice.issued_at.desc()).all()
        return invoices
    finally:
        db.close()

class CancelReason(BaseModel):
    justification: str

@app.delete("/invoices/{ref}")
def cancel_invoice(ref: str, body: CancelReason):
    if len(body.justification) < 15:
        raise HTTPException(status_code=400, detail="Justificativa deve ter pelo menos 15 caracteres")
        
    db = SessionLocal()
    invoice = db.query(models.Invoice).filter(models.Invoice.ref == ref).first()
    
    if not invoice:
        db.close()
        raise HTTPException(status_code=404, detail="Nota fiscal não encontrada")
        
    # Call Focus NFe API to cancel
    # DELETE https://api.focusnfe.com.br/v2/nfe/{ref}?justificativa={justification}
    url = f"{settings.FOCUS_NFE_URL}/nfe/{ref}"
    
    print(f"🚫 CANCELANDO NFe: {ref}")
    print(f"Justificativa: {body.justification}")
    
    try:
        # Focus API expects justification in the BODY for DELETE
        response = requests.delete(
            url, 
            json={"justificativa": body.justification},
            auth=(settings.FOCUS_NFE_TOKEN, "")
        )
        
        print(f"Cancel Status: {response.status_code}")
        print(response.text)
        
        if response.status_code in [200, 201]:
            # Update local status
            invoice.status = "cancelado"
            db.commit()
            return {"message": "Nota fiscal cancelada com sucesso", "details": response.json()}
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# Webhook Schema for Focus NFe notifications - Schema completo
class FocusWebhookPayload(BaseModel):
    ref: str  # Referência da venda
    status: str  # ex: 'autorizado', 'cancelado', 'erro_autorizacao'
    status_sefaz: str = None
    mensagem_sefaz: str = None
    chave_nfe: str = None  # Chave de acesso da NFe (44 dígitos)
    numero: str = None  # Número da nota fiscal
    protocolo: str = None  # Protocolo de autorização
    caminho_danfe: str = None  # Caminho relativo do PDF
    caminho_xml_nota_fiscal: str = None  # Caminho relativo do XML
    cnpj_emitente: str = None  # CNPJ do emitente (opcional)

@app.post("/webhook/focus")
def receive_focus_webhook(payload: FocusWebhookPayload):
    import json
    
    print(f"🔔 WEBHOOK RECEBIDO: {payload.ref} - {payload.status}")
    print(json.dumps(payload.dict(), indent=2))
    
    db = SessionLocal()
    
    # Update ManualInvoice (Legacy)
    invoice = db.query(models.ManualInvoice).filter(models.ManualInvoice.ref == payload.ref).first()
    if invoice:
        invoice.status = payload.status
        invoice.status_sefaz = payload.status_sefaz
        invoice.mensagem_sefaz = payload.mensagem_sefaz
        
        if payload.caminho_danfe:
            invoice.danfe_url = f"https://api.focusnfe.com.br{payload.caminho_danfe}"
            
        if payload.caminho_xml_nota_fiscal:
            invoice.xml_url = f"https://api.focusnfe.com.br{payload.caminho_xml_nota_fiscal}"
            
        db.commit()
        print(f"✅ ManualInvoice {payload.ref} atualizada para {payload.status}")
        
    # Update Invoice (Financial Module)
    fin_invoice = db.query(models.Invoice).filter(models.Invoice.ref == payload.ref).first()
    if fin_invoice:
        fin_invoice.status = payload.status
        if payload.numero: fin_invoice.number = payload.numero
        if payload.chave_nfe: fin_invoice.access_key = payload.chave_nfe
        
        if payload.caminho_danfe:
            fin_invoice.pdf_url = f"https://api.focusnfe.com.br{payload.caminho_danfe}"
            
        if payload.caminho_xml_nota_fiscal:
            fin_invoice.xml_url = f"https://api.focusnfe.com.br{payload.caminho_xml_nota_fiscal}"
            
        db.commit()
        print(f"✅ Financial Invoice {payload.ref} atualizada para {payload.status}")
    
    db.close()
    
    return {"received": True}

