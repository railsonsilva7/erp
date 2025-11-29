from pydantic import BaseModel
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    quantity: int
    price: float
    ncm: str = "85171231"
    cfop: str = "5102"
    unit: str = "un"

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

class CompanySettingsBase(BaseModel):
    cnpj: str
    ie: str
    razao_social: str
    nome_fantasia: str
    logradouro: str
    numero: str
    bairro: str
    municipio: str
    uf: str
    cep: str
    regime_tributario: int = 1

class CompanySettingsCreate(CompanySettingsBase):
    pass

class CompanySettings(CompanySettingsBase):
    id: int

    class Config:
        from_attributes = True

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int

class SaleCreate(BaseModel):
    items: List[SaleItemCreate]

class ManualInvoiceItem(BaseModel):
    name: str
    ncm: str
    cfop: str
    price: float
    quantity: int

class ManualInvoiceRecipient(BaseModel):
    cpf_cnpj: str
    name: str
    logradouro: str
    numero: str
    bairro: str
    municipio: str
    uf: str
    cep: str

class ManualInvoiceRequest(BaseModel):
    recipient: ManualInvoiceRecipient
    item: ManualInvoiceItem

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

