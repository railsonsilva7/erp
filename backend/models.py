from sqlalchemy import Column, Integer, String, Float
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Integer)
    price = Column(Float)
    ncm = Column(String, default="85171231")
    cfop = Column(String, default="5102")
    unit = Column(String, default="un")

class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    cnpj = Column(String, unique=True, index=True)
    ie = Column(String)
    razao_social = Column(String)
    nome_fantasia = Column(String)
    logradouro = Column(String)
    numero = Column(String)
    bairro = Column(String)
    municipio = Column(String)
    uf = Column(String)
    cep = Column(String)
    regime_tributario = Column(Integer, default=1) # 1=Simples Nacional

class ManualInvoice(Base):
    __tablename__ = "manual_invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    ref = Column(String, unique=True, index=True)
    status = Column(String, default="processando")  # processando, autorizado, erro_autorizacao, cancelado
    status_sefaz = Column(String)
    mensagem_sefaz = Column(String)
    danfe_url = Column(String)
    xml_url = Column(String)
    created_at = Column(String)
    recipient_name = Column(String)
    total_value = Column(Float)

class Invoice(Base):
    __tablename__ = "invoices"

    ref = Column(String, primary_key=True, index=True)
    sale_id = Column(Integer, nullable=True)
    status = Column(String) # autorizado, cancelado, erro
    number = Column(String)
    series = Column(String)
    access_key = Column(String)
    pdf_url = Column(String)
    xml_url = Column(String)
    issued_at = Column(String) # Storing as ISO string for simplicity
    recipient_name = Column(String)
    total_value = Column(Float)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)

