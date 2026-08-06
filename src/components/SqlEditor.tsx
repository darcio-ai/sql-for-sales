import CodeMirror from "@uiw/react-codemirror";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import { githubDark } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";

export default function SqlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      minHeight="200px"
      theme={githubDark}
      extensions={[sql({ dialect: PostgreSQL, upperCaseKeywords: false }), EditorView.lineWrapping]}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        autocompletion: true,
      }}
      style={{ fontSize: "14px" }}
      placeholder="select deal_name, amount from deals;"
    />
  );
}
