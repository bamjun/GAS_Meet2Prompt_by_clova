function docsClearAddText({contentText = "contentText=text", docId = test_doc_id}) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  body.clear()
  body.appendParagraph(contentText);
  doc_page_url = `https://docs.google.com/document/d/${docId}/edit`
  Logger.log(`doc_page_url : ${doc_page_url}`)
}

function docsAddText({contentText = "contentText=text", docId = test_doc_id}) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  body.appendParagraph(contentText);
  doc_page_url = `https://docs.google.com/document/d/${docId}/edit`
  Logger.log(`doc_page_url : ${doc_page_url}`)
}
