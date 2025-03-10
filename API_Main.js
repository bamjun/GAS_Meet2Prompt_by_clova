function doGet(e) {
  var action = e.parameter.action;

  switch (action) {
    case "transcribe":
      return apiRouterTranscribe(e);
    case "aiPrompt":
      return apiRouterAiPrompt(e);
    default:
      return ContentService.createTextOutput("Invalid action parameter");
  }
}