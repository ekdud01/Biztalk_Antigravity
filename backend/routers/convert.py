from fastapi import APIRouter, HTTPException, Depends
from backend.models.schemas import ConvertRequest, ConvertResponse
from backend.services.tone_converter import ToneConverter

router = APIRouter()

# 의존성 주입을 위한 ToneConverter 단일 인스턴스 생성 및 주입 함수
_converter = None

def get_tone_converter():
    global _converter
    if _converter is None:
        try:
            _converter = ToneConverter()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))
    return _converter

@router.post("/convert", response_model=ConvertResponse)
async def convert_tone(
    request: ConvertRequest, 
    converter: ToneConverter = Depends(get_tone_converter)
):
    try:
        converted = await converter.convert(request.text, request.target_audience)
        return ConvertResponse(
            converted_text=converted,
            target_audience=request.target_audience,
            original_text=request.text
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # LLM API 호출 등 기타 런타임 오류 발생 시
        raise HTTPException(status_code=500, detail=f"LLM API 호출 중 오류가 발생했습니다: {str(e)}")
