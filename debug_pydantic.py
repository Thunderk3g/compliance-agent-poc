from pydantic import BaseModel, ValidationError

class Test(BaseModel):
    a: int

try:
    print("Attempting to create model with extra field...")
    t = Test(a=1, b=2)
    print(f"Success: {t}")
except ValidationError as e:
    print(f"Caught ValidationError: {e}")
except Exception as e:
    print(f"Caught Exception: {e}")
