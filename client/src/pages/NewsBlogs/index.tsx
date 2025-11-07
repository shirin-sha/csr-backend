import React, { useEffect, useState } from "react";
import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { convertToHTML } from "draft-convert";
// import draftToHtml from "draftjs-to-html";
// import htmlToDraft from "html-to-draftjs";
import DOMPurify from "dompurify";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { resetCalendar } from "src/store/actions";

const newsBlogs = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  
  console.log("editorState", editorState);
  
  const [convertedContent, setConvertedContent] = useState(null);
  console.log("convertedContent", convertedContent);
  
  const handleEditorChange = (state: any) => {
    setEditorState(state);
    convertContentToHTML();
    EditorState.createEmpty();
  };
  const convertContentToHTML = () => {
    const currentContentAsHTML: any = convertToHTML(
      editorState.getCurrentContent()
    );
    setConvertedContent(currentContentAsHTML);
  };
  const createMarkup = (html: any) => {
    return {
      __html: DOMPurify.sanitize(html),
    };
  };
  return (
    <div className="App" style={{ marginTop: "6rem" }}>
      <header className="App-header">Rich Text Editor Example</header>
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        wrapperClassName="wrapper-class"
        editorClassName="editor-class"
        toolbarClassName="toolbar-class"
      />
      <div
        className="preview"
        dangerouslySetInnerHTML={createMarkup(convertedContent)}
      ></div>
    </div>
  );
};
export default newsBlogs;
