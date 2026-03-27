import { createPost } from "../actions";
import PostEditorForm from "../../components/PostEditorForm";

export default function NewPostPage() {
  async function action(formData: FormData) {
    "use server";
    await createPost(formData);
  }

  return (
    <>
      <div className="panel-head">
        <h2>New Post</h2>
      </div>

      <div
        style={{
          marginBottom: 18,
          padding: "10px 14px",
          borderRadius: 12,
          background: "#f7f4ff",
          border: "1px solid #e2dafd",
          color: "#6b5fd6",
          fontSize: 13,
        }}
      >
        Save the draft once first, then use Preview Draft from the edit page.
      </div>

      <PostEditorForm onSubmit={action} />
    </>
  );
}