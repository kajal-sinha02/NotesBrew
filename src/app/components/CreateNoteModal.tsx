"use client";

import React from "react";
import { X } from "lucide-react";

interface FormData {
  title: string;
  content: string;
  branch: string;
  semester: string;
  subject: string;
  file: File | null;
}

interface CreateNoteModalProps {
  show: boolean;
  formData: FormData;
  isEditing: boolean;
  onClose: () => void;
  onFormDataChange: (key: keyof FormData, value: string | File | null) => void;
  onSubmit: () => Promise<void>;
  error: string;
}

export default function CreateNoteModal({
  show,
  formData,
  isEditing,
  onClose,
  onFormDataChange,
  onSubmit,
  error,
}: CreateNoteModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-2 z-50">
      <div className="bg-gray-900 rounded-md p-4 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Edit Note" : "Create Note"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-600 text-sm text-red-100 rounded">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-2"
        >
          <InputField
            label="Title"
            value={formData.title}
            onChange={(e) => onFormDataChange("title", e.target.value)}
          />

          <TextAreaField
            label="Content"
            value={formData.content}
            onChange={(e) => onFormDataChange("content", e.target.value)}
          />

          <SelectField
            label="Branch"
            value={formData.branch}
            options={["CSE", "ECE", "ME", "CE", "EE"]}
            onChange={(e) => onFormDataChange("branch", e.target.value)}
          />

          <SelectField
            label="Semester"
            value={formData.semester}
            options={["1", "2", "3", "4", "5", "6", "7", "8"]}
            onChange={(e) => onFormDataChange("semester", e.target.value)}
          />

          <InputField
            label="Subject"
            value={formData.subject}
            onChange={(e) => onFormDataChange("subject", e.target.value)}
          />

          <div>
            <label className="text-sm text-gray-300">File (optional):</label>
            <input
              type="file"
              onChange={(e) =>
                onFormDataChange("file", e.target.files?.[0] || null)
              }
              className="w-full mt-1 text-sm text-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable UI components

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="text-sm text-gray-300">{label}:</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        required
        className="w-full px-2 py-1 mt-1 text-sm bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  return (
    <div>
      <label className="text-sm text-gray-300">{label}:</label>
      <textarea
        value={value}
        onChange={onChange}
        required
        rows={3}
        className="w-full px-2 py-1 mt-1 text-sm bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <div>
      <label className="text-sm text-gray-300">{label}:</label>
      <select
        value={value}
        onChange={onChange}
        required
        className="w-full px-2 py-1 mt-1 text-sm bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" className="bg-gray-800 text-gray-400">
          Select {label}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-gray-800 text-white">
            {label === "Semester" ? `Semester ${opt}` : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
