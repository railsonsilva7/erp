import requests
import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

TOKEN = os.getenv("FOCUS_NFE_TOKEN")
# Hardcode the CNPJ emitente from the logs if env var is missing or different
CNPJ_EMITENTE = "05891629000516" 
BASE_URL = "https://api.focusnfe.com.br/v2"

def test_payload(variant_name, destinatario_data):
    print(f"\n--- Testing Variant: {variant_name} ---")
    
    ref_id = uuid.uuid4().hex
    
    payload = {
        "natureza_operacao": "Venda de Mercadoria",
        "data_emissao": datetime.now().isoformat(),
        "tipo_documento": 1,
        "local_destino": 1,
        "finalidade_emissao": 1,
        "consumidor_final": 0,
        "presenca_comprador": 1,
        "modalidade_frete": 9,
        "cnpj_emitente": CNPJ_EMITENTE,
        "destinatario": destinatario_data,
        "itens": [
            {
                "numero_item": 1,
                "codigo_produto": "ITEM01",
                "descricao": "Produto Teste Debug",
                "codigo_ncm": "85171231",
                "cfop": "5102",
                "unidade_comercial": "un",
                "quantidade_comercial": 1,
                "valor_unitario_comercial": 100.0,
                "unidade_tributavel": "un",
                "quantidade_tributavel": 1,
                "valor_unitario_tributavel": 100.0,
                "icms_origem": "0",
                "icms_situacao_tributaria": "102"
            }
        ]
    }
    
    url = f"{BASE_URL}/nfe?ref={ref_id}"
    
    try:
        response = requests.post(url, json=payload, auth=(TOKEN, ""))
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

# Common data
common_dest = {
    "nome": "TECH CENTER SOLUCOES EM TECNOLOGIA LTDA",
    "logradouro": "Avenida Liberdade III COZOA CD E GO7",
    "numero": "1935",
    "bairro": "Itainga",
    "municipio": "Sorocaba",
    "uf": "SP",
    "cep": "18087170",
    "indicador_inscricao_estadual": "1",
    "inscricao_estadual": "669792904113",
    "codigo_municipio": "3552205",
    "codigo_pais": "1058",
    "pais": "BRASIL"
}

# Variant 5: consumidor_final = 1 (Consumer)
print("\n--- Testing Variant: consumidor_final=1 ---")
payload_v5 = {
    "natureza_operacao": "Venda de Mercadoria",
    "data_emissao": datetime.now().isoformat(),
    "tipo_documento": 1,
    "local_destino": 1,
    "finalidade_emissao": 1,
    "consumidor_final": 1, # CHANGED
    "presenca_comprador": 1,
    "modalidade_frete": 9,
    "cnpj_emitente": CNPJ_EMITENTE,
    "destinatario": {
        "cnpj": "07771362000175",
        "nome": "TECH CENTER SOLUCOES EM TECNOLOGIA LTDA",
        "logradouro": "Avenida Liberdade III COZOA CD E GO7",
        "numero": "1935",
        "bairro": "Itainga",
        "municipio": "Sorocaba",
        "uf": "SP",
        "cep": "18087170",
        "indicador_inscricao_estadual": "9", # CHANGED to Non-Taxpayer
        "codigo_municipio": "3552205",
        "codigo_pais": "1058",
        "pais": "BRASIL"
    },
    "itens": [
        {
            "numero_item": 1,
            "codigo_produto": "ITEM01",
            "descricao": "Produto Teste Debug",
            "codigo_ncm": "85171231",
            "cfop": "5102",
            "unidade_comercial": "un",
            "quantidade_comercial": 1,
            "valor_unitario_comercial": 100.0,
            "unidade_tributavel": "un",
            "quantidade_tributavel": 1,
            "valor_unitario_tributavel": 100.0,
            "icms_origem": "0",
            "icms_situacao_tributaria": "102"
        }
    ]
}
url = f"{BASE_URL}/nfe?ref={uuid.uuid4().hex}"
try:
    response = requests.post(url, json=payload_v5, auth=(TOKEN, ""))
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")


# Variant 7: Full Flattened Destinatario (The Solution?)
print("\n--- Testing Variant: Full Flattened Destinatario ---")
payload_v7 = {
    "natureza_operacao": "Venda de Mercadoria",
    "data_emissao": datetime.now().isoformat(),
    "tipo_documento": 1,
    "local_destino": 1,
    "finalidade_emissao": 1,
    "consumidor_final": 0,
    "presenca_comprador": 1,
    "modalidade_frete": 9,
    "cnpj_emitente": CNPJ_EMITENTE,
    
    # Flattened fields
    "cnpj_destinatario": "07771362000175",
    "nome_destinatario": "TECH CENTER SOLUCOES EM TECNOLOGIA LTDA",
    "logradouro_destinatario": "Avenida Liberdade III COZOA CD E GO7",
    "numero_destinatario": "1935",
    "bairro_destinatario": "Itainga",
    "municipio_destinatario": "Sorocaba",
    "uf_destinatario": "SP",
    "cep_destinatario": "18087170",
    "telefone_destinatario": "",
    "inscricao_estadual_destinatario": "669792904113",
    "indicador_inscricao_estadual_destinatario": "1", # Guessing the key name
    "codigo_municipio_destinatario": "3552205", # Guessing the key name
    "pais_destinatario": "BRASIL", # Guessing
    "codigo_pais_destinatario": "1058", # Guessing

    "itens": [
        {
            "numero_item": 1,
            "codigo_produto": "ITEM01",
            "descricao": "Produto Teste Debug Flattened",
            "codigo_ncm": "85171231",
            "cfop": "5102",
            "unidade_comercial": "un",
            "quantidade_comercial": 1,
            "valor_unitario_comercial": 100.0,
            "unidade_tributavel": "un",
            "quantidade_tributavel": 1,
            "valor_unitario_tributavel": 100.0,
            "icms_origem": "0",
            "icms_situacao_tributaria": "102"
        }
    ]
}
url = f"{BASE_URL}/nfe?ref={uuid.uuid4().hex}"
try:
    response = requests.post(url, json=payload_v7, auth=(TOKEN, ""))
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
