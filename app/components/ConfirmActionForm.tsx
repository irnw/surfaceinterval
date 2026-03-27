"use client";

export default function ConfirmActionForm({
  action,
  label,
  message,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  message: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const confirmed = window.confirm(message);
        if (!confirmed) e.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}