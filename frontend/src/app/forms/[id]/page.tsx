"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Donation = {
  id: number;
  amount: number;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
};

type FormDetail = {
  id: number;
  title: string;
  description: string;
  goal_amount: number | null;
  is_active: number;
  allow_monthly_donations: number;
  created_at: string;
  donations: Donation[];
};

export default function FormDetailPage() {
  var params = useParams();
  var [form, setForm] = useState<FormDetail | null>(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState<string | null>(null);
  const [savingMonthly, setSavingMonthly] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  function handleToggleMonthly(enabled: boolean) {
    setSavingMonthly(true);
    setSettingsError(null);
    fetch(`http://localhost:3001/api/forms/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allow_monthly_donations: enabled }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update monthly donations");
        return res.json();
      })
      .then((updated) =>
        setForm((prev) =>
          prev
            ? { ...prev, allow_monthly_donations: updated.allow_monthly_donations }
            : prev
        )
      )
      .catch((err) => setSettingsError(err.message))
      .finally(() => setSavingMonthly(false));
  }

  useEffect(() => {
    fetch(`http://localhost:3001/api/forms/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Form not found");
        return res.json();
      })
      .then((data) => setForm(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error)
    return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!form) return <div className="p-6 text-gray-500">Form not found</div>;

  var totalRaised = form.donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <a
          href="/forms"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Forms
        </a>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-500 mt-2">{form.description}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              form.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {form.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-50 rounded-md p-4">
            <span className="text-sm text-gray-500 block">Total Raised</span>
            <span className="text-xl font-bold">
              ${(totalRaised / 100).toFixed(2)}
            </span>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <span className="text-sm text-gray-500 block">Goal</span>
            <span className="text-xl font-bold">
              {form.goal_amount
                ? `$${(form.goal_amount / 100).toFixed(2)}`
                : "No goal"}
            </span>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <span className="text-sm text-gray-500 block">Donations</span>
            <span className="text-xl font-bold">{form.donations.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Donation Options</h2>
        </div>
        <div className="p-4 flex items-center justify-between gap-6">
          <div>
            <span id="monthly-label" className="block text-sm font-medium text-gray-900">
              Monthly donations
            </span>
            <span className="block text-sm text-gray-500">
              Let donors choose to give every month instead of once.
            </span>
            {settingsError && (
              <span className="block text-sm text-red-600 mt-1">
                {settingsError}
              </span>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!form.allow_monthly_donations}
            aria-labelledby="monthly-label"
            disabled={savingMonthly}
            onClick={() => handleToggleMonthly(!form!.allow_monthly_donations)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
              form.allow_monthly_donations ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                form.allow_monthly_donations ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Donation History</h2>
        </div>
        {form.donations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No donations yet
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Donor</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {form.donations.map((donation) => (
                <tr
                  key={donation.id}
                  className="border-b last:border-0 text-sm"
                >
                  <td className="px-4 py-3">
                    {donation.first_name} {donation.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{donation.email}</td>
                  <td className="px-4 py-3 font-medium">
                    ${(donation.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
