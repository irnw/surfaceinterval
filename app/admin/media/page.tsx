"use client";

import MediaLibrary from "../../components/MediaLibrary";

export default function MediaPage() {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Media</h2>
          <p>Upload images and copy URLs for use in posts and hero slides.</p>
        </div>
      </div>

      <MediaLibrary
        onSelect={(url) => {
          navigator.clipboard.writeText(url).catch(() => {});
        }}
      />
    </div>
  );
}