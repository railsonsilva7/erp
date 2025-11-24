import requests
import json
from datetime import datetime
from config import settings
from database import SessionLocal
from models import CompanySettings

class FocusNFeClient:
    def __init__(self):
        self.token = settings.FOCUS_NFE_TOKEN
        # SEMPRE usar URL de produção - o ambiente é definido no painel da Focus
        self.base_url = settings.FOCUS_NFE_URL

    def emit_nfe(self, sale_data: dict):
        # Fetch company settings from DB
        db = SessionLocal()
        company = db.query(CompanySettings).first()
        db.close()

        cnpj_emitente = company.cnpj if company else settings.FOCUS_NFE_CNPJ
        # Strip non-numeric characters
        cnpj_emitente = "".join(filter(str.isdigit, cnpj_emitente)) if cnpj_emitente else ""

        payload = {
            "natureza_operacao": "Venda de Mercadoria",
            "cnpj_emitente": cnpj_emitente,
            "data_emissao": sale_data.get("date"),
            "ref": sale_data.get("id"),
            "itens": [
                {
                    "codigo_produto": item["id"],
                    "nome_produto": item["name"],
                    "cfop": "5102", # Default intra-state sale
                    "quantidade": item["quantity"],
                    "valor_unitario": item["unitPrice"],
                    "valor_total": item["subtotal"]
                } for item in sale_data.get("items", [])
            ],
            # Placeholder for client data (required for NFe)
            "destinatario": {
                "nome": "Consumidor Final",
                "cpf": "000.000.000-00",
                "indicador_inscricao_estadual": "9"
            }
        }

        url = f"{self.base_url}/nfe"
        
        # Debug: Show masked token and URL
        masked_token = f"{self.token[:4]}...{self.token[-4:]}" if self.token and len(self.token) > 8 else "INVALIDO"
        print(f"🔐 Token usado: {masked_token}")
        print(f"📡 URL: {url}")
        print(f"🏢 CNPJ Emitente: {cnpj_emitente}")

        # Check if token is configured
        if "COLE_SEU_TOKEN_AQUI" in str(self.token) or not self.token:
            print("⚠️ Token não configurado. Retornando Mock.")
            return {
                "status": "erro_configuracao",
                "message": "Token da API Fiscal não configurado no .env"
            }
        
        try:
            # Basic Auth with Token as username
            response = requests.post(url, json=payload, auth=(self.token, ""))
            
            # Handle specific auth errors
            if response.status_code in [401, 403]:
                print(f"❌ Erro de Autenticação ({response.status_code}): {response.text}")
                raise Exception("Acesso Negado. Verifique se o TOKEN está correto e se é do ambiente de HOMOLOGAÇÃO.")

            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Resposta da API: {data}")
            return data
            
        except requests.exceptions.HTTPError as e:
            error_content = e.response.text
            print(f"❌ Erro na API Fiscal: {error_content}")
            raise Exception(f"Erro na API Fiscal: {error_content}")
        except Exception as e:
            print(f"❌ Erro inesperado: {str(e)}")
            raise e

    def emit_manual_nfe(self, data: dict):
        # Fetch company settings from DB
        db = SessionLocal()
        company = db.query(CompanySettings).first()
        db.close()

        cnpj_emitente = company.cnpj if company else settings.FOCUS_NFE_CNPJ
        cnpj_emitente = "".join(filter(str.isdigit, cnpj_emitente)) if cnpj_emitente else ""

        # Prepare payload
        recipient = data["recipient"]
        item = data["item"]
        
        # Determine if CPF or CNPJ
        cpf_cnpj_value = "".join(filter(str.isdigit, recipient["cpf_cnpj"]))
        destinatario_data = {
            "nome": recipient["name"],
            "logradouro": recipient["logradouro"],
            "numero": recipient["numero"],
            "bairro": recipient["bairro"],
            "municipio": recipient["municipio"],
            "uf": recipient["uf"],
            "cep": recipient["cep"],
            "indicador_inscricao_estadual": "9"
        }

        if len(cpf_cnpj_value) > 11:
            destinatario_data["cnpj"] = cpf_cnpj_value
        else:
            destinatario_data["cpf"] = cpf_cnpj_value

        payload = {
            "natureza_operacao": "Venda de Mercadoria (Avulsa)",
            "cnpj_emitente": cnpj_emitente,
            "data_emissao": datetime.now().isoformat(),
            "tipo_documento": 1, # 1 - Saída
            "finalidade_emissao": 1, # 1 - Normal
            "modalidade_frete": 9, # 9 - Sem frete
            "ref": f"manual-{item['name'][:5]}", 
            "itens": [
                {
                    "numero_item": 1,
                    "codigo_produto": "MANUAL-001",
                    "descricao": item["name"],
                    "codigo_ncm": item["ncm"],
                    "cfop": item["cfop"],
                    "unidade_comercial": "UN",
                    "quantidade_comercial": item["quantity"],
                    "valor_unitario_comercial": item["price"],
                    "unidade_tributavel": "UN",
                    "quantidade_tributavel": item["quantity"],
                    "valor_unitario_tributavel": item["price"],
                    "valor_bruto": item["price"] * item["quantity"],
                    "valor_total": item["price"] * item["quantity"]
                }
            ],
            "destinatario": destinatario_data
        }

        url = f"{self.base_url}/nfe"
        
        print(f"📡 Enviando NFe Manual para: {url}")
        print(f"📦 Payload: {json.dumps(payload, indent=2)}")

        try:
            response = requests.post(url, json=payload, auth=(self.token, ""))
            
            if response.status_code in [401, 403]:
                 raise Exception(f"Erro de Autenticação: {response.text}")

            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            error_content = e.response.text
            print(f"❌ Erro na API Fiscal: {error_content}")
            # Return the error as JSON so frontend can see it
            try:
                return json.loads(error_content)
            except:
                return {"error": error_content}
        except Exception as e:
            print(f"❌ Erro inesperado: {str(e)}")
            raise e

fiscal_client = FocusNFeClient()
