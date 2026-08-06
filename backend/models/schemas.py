from pydantic import BaseModel, Field

class ConvertRequest(BaseModel):
    text: str = Field(..., min_length=1, description="변환할 원문 텍스트")
    target_audience: str = Field(..., description="수신 대상 (boss / colleague / client / team)")

class ConvertResponse(BaseModel):
    converted_text: str = Field(..., description="AI 변환 결과 텍스트")
    target_audience: str = Field(..., description="요청된 수신 대상")
    original_text: str = Field(..., description="요청된 원문 텍스트")
