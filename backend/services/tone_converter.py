import os
from dotenv import load_dotenv
from langchain_upstage import ChatUpstage
from backend.prompts.templates import PROMPTS

# .env 로드
load_dotenv()

class ToneConverter:
    def __init__(self):
        # 환경변수 내 UPSTAGE_API_KEY 검증
        if not os.getenv("UPSTAGE_API_KEY"):
            raise ValueError("UPSTAGE_API_KEY environment variable is missing.")
        
        # langchain-upstage의 ChatUpstage를 통해 solar-pro3 모델 초기화
        self.llm = ChatUpstage(model="solar-pro3")

    async def convert(self, text: str, target_audience: str) -> str:
        if target_audience not in PROMPTS:
            raise ValueError(f"Invalid target audience: {target_audience}")

        # 프롬프트 구성 및 실행
        prompt_template = PROMPTS[target_audience]
        formatted_prompt = prompt_template.format(text=text)
        
        response = await self.llm.ainvoke(formatted_prompt)
        return response.content.strip()
