# 구글밋 프롬프트
- 구글 밋에서 구글드라이브로 저장된 파일을 엑셀파일에 정리
- 네이버 클로바를 통해서 구글 독스에 스크립트 변환
- 변한된 스크립트 AI프롬프트로 변환





---
# log

### [001] 2025-03-14

- API_Service.js > API_Service_Transcribe > transcribeVideo
- 에러남

```
오후 2:21:14	알림	실행이 시작됨
오후 2:21:15	정보	음성 인식 처리 중 오류 발생: File videoplayback.mp4 exceeds the maximum file size.
오후 2:21:15	오류	
Error: 음성 인식 처리 중 오류 발생: File videoplayback.mp4 exceeds the maximum file size.
transcribeVideo	@ API_Service.gs:96
test_api_service_1	@ API_Service.gs:278
```

> - 앱스크립트 자체적으로 구글드라이브파일 불러올때 용량제한 있을수있음.  
> - ~~드라이브자체 URL로 파일 다운해야함. (전체권한으로 해야해서 보안 이슈있을수있음.)~~
> - cloud run 으로 보인 이슈 해결할수있지만, 다른 사람들이 사용할때 설정이 어려울수있음.
> - 10MB 넘는 파일을 클로바에 업로드하려면, cloud run이나 다른 컴퓨팅 자원을 이용해야함.. python anywhere로 api를 만들거나  다른 방법을 찾아야 할꺼같음.