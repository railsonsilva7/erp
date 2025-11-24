import requests
import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("FOCUS_NFE_TOKEN")
CNPJ = os.getenv("FOCUS_NFE_CNPJ")
ENV = os.getenv("FOCUS_NFE_ENV", "sandbox")

# Try Production URL for company management as per docs
BASE_URL = "https://api.focusnfe.com.br/v2"

def register_company():
    # Try listing first to check connection
    print(f"Testing connection to {BASE_URL}...")
    try:
        # Try to get specific company
        get_url = f"{BASE_URL}/empresas/{CNPJ}"
        print(f"GET {get_url}")
        response = requests.get(get_url, auth=(TOKEN, ""))
        print(f"GET Status: {response.status_code}")
        if response.status_code == 200:
            print("Company already exists:")
            print(response.json())
            return

        # If not found, try to create
        url = f"{BASE_URL}/empresas"
        print(f"POST {url}")
        
        payload = {
            "nome": "EMPRESA DE TESTE SANDBOX",
            "nome_fantasia": "TESTE SANDBOX",
            "inscricao_estadual": "ISENTO",
            "cnpj": CNPJ,
            "regime_tributario": "1", # Simples Nacional
            "email": "teste@example.com",
            "telefone": "11999999999",
            "logradouro": "Rua de Teste",
            "numero": "123",
            "bairro": "Centro",
            "cep": "01001-000",
            "municipio": "São Paulo",
            "uf": "SP",
            "habilita_nfe": True,
            "habilita_nfce": True
        }

        response = requests.post(url, json=payload, auth=(TOKEN, ""))
        
        if response.status_code in [200, 201]:
            print("✅ Company registered successfully!")
            print(response.json())
        elif response.status_code == 422:
            print("⚠️ Validation Error:")
            print(response.text)
        else:
            print(f"❌ Error registering company: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    register_company()
