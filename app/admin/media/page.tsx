"use client";

import MediaLibrary from "../../components/MediaLibrary";

export default function MediaPage() {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Media</h2>
          <p>Upload images and video clips. Click any file to copy its URL.</p>
        </div>
      </div>

      <MediaLibrary
        selectable={false}
        onSelect={(url) => {
          navigator.clipboard.writeText(url).catch(() => {});
        }}
      />
    </div>
  );
}