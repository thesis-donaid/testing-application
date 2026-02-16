"use client";

import { useState } from "react";

interface RequestFormProps {
    beneficiaryId: number;
    onSuccess: () => void;
}

export default function RequestForm({ beneficiaryId, onSuccess }: RequestFormProps) {
    const [formData, setFormData] = useState({
        purpose: "",
        amount: "",
        date_needed: "",
        email: "",
        additional_notes: "",
        urgency_level: "LOW",
    });
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploadProgress, setUploadProgress] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Step 1: Create the request
            const res = await fetch("/api/beneficiary/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    beneficiaryId,
                    amount: parseFloat(formData.amount),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create request");
            }

            const requestId = data.id;

            // Step 2: Upload files if any
            if (files && files.length > 0) {
                setUploadProgress(`Uploading ${files.length} file(s)...`);

                const formDataFiles = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formDataFiles.append("files", files[i]);
                }

                const uploadRes = await fetch(
                    `/api/beneficiary/requests/${requestId}/documents`,
                    {
                        method: "POST",
                        body: formDataFiles,
                    }
                );

                if (!uploadRes.ok) {
                    const uploadError = await uploadRes.json();
                    console.error("File upload error:", uploadError);
                    // Don't throw - request was created, just files failed
                    setError(`Request created but file upload failed: ${uploadError.error}`);
                }
            }

            setUploadProgress("");
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {uploadProgress && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                    {uploadProgress}
                </div>
            )}

            {/* Purpose */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose *
                </label>
                <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Tuition fee assistance"
                />
            </div>

            {/* Amount */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (PHP) *
                </label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                />
            </div>

            {/* Date Needed */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Needed *
                </label>
                <input
                    type="date"
                    name="date_needed"
                    value={formData.date_needed}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email *
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                />
            </div>

            {/* Urgency Level */}

            {/* Additional Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                </label>
                <textarea
                    name="additional_notes"
                    value={formData.additional_notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional information..."
                />
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Documents (PNG, JPG, PDF - Max 10MB each)
                </label>
                <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {files && files.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                        {files.length} file(s) selected
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Submitting..." : "Submit Request"}
            </button>
        </form>
    );
}
