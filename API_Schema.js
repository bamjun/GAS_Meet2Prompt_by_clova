/**
 * API 요청 파라미터 검증을 위한 스키마 정의
 */
class API_RequestSchema {
  /**
   * 검증 결과를 ContentService 응답으로 변환
   * @param {Object} validation - 검증 결과 객체
   * @returns {ContentService.TextOutput} 응답 객체
   */
  static createValidationResponse(validation) {
    if (!validation.isValid) {
      return ContentService.createTextOutput(validation.message);
    }
    return null;
  }

  /**
   * 전사 요청 파라미터 검증
   * @param {Object} params - 요청 파라미터
   * @returns {Object} 검증 결과 {isValid: boolean, message: string}
   */
  static validateTranscribeParams(params) {
    const fileId = params.fileId;
    const row = parseInt(params.row, 10);

    if (!fileId || isNaN(row)) {
      return {
        isValid: false,
        message: "Invalid parameters."
      };
    }

    return {
      isValid: true,
      message: "",
      data: {
        fileId: fileId,
        row: row,
        rawRow: params.row
      }
    };
  }

  /**
   * AI 프롬프트 요청 파라미터 검증
   * @param {Object} params - 요청 파라미터
   * @returns {Object} 검증 결과 {isValid: boolean, message: string}
   */
  static validateAiPromptParams(params) {
    const fileId = params.fileId;
    const row = parseInt(params.row, 10);

    if (!fileId || isNaN(row)) {
      return {
        isValid: false,
        message: "Invalid parameters."
      };
    }

    return {
      isValid: true,
      message: "",
      data: {
        fileId: fileId,
        row: row,
        rawRow: params.row
      }
    };
  }
}
