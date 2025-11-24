import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # SEMPRE usar URL de produção (o ambiente da nota é definido no painel da Focus)
    FOCUS_NFE_URL = "https://api.focusnfe.com.br/v2"
    FOCUS_NFE_TOKEN = os.getenv("FOCUS_NFE_TOKEN")
    FOCUS_NFE_CNPJ = os.getenv("FOCUS_NFE_CNPJ")

settings = Settings()

# Log de segurança para verificar se o token foi carregado
if settings.FOCUS_NFE_TOKEN:
    print(f'🔑 TOKEN CARREGADO: {settings.FOCUS_NFE_TOKEN[:4]}... (Verifique se esses 4 dígitos batem com o painel)')
    print(f'🌍 URL BASE: {settings.FOCUS_NFE_URL}')
else:
    print('⚠️ AVISO: TOKEN NÃO ENCONTRADO NO .env')
