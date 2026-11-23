"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useContactDetail } from "@/hooks/useContacts";
import type { ContactDonation } from "@/types/contacts";

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = Number(params.id);
  const { data: contact, isLoading, error } = useContactDetail(contactId);

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading contact...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Failed to load contact: {error.message}
      </div>
    );
  }

  if (!contact) {
    return <div className="p-6 text-gray-500">Contact not found</div>;
  }

  const totalDonated = contact.donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/contacts"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Contacts
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {contact.first_name} {contact.last_name}
        </h1>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Email:</span>
            <span>{contact.email}</span>
          </div>
          {contact.phone && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-20">Phone:</span>
              <span>{contact.phone}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Joined:</span>
            <span>
              {new Date(contact.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 rounded-md p-4">
            <span className="text-sm text-gray-500 block">Total Donated</span>
            <span className="text-xl font-bold text-green-600">
              ${(totalDonated / 100).toFixed(2)}
            </span>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <span className="text-sm text-gray-500 block">Donations</span>
            <span className="text-xl font-bold">
              {contact.donations.length}
            </span>
          </div>
        </div>
      </div>

      <DonationTable
        title="Recurring Donations"
        emptyMessage="No recurring donations set up"
        donations={contact.recurring_donations}
        amountSuffix=" / month"
        className="mb-6"
      />

      <DonationTable
        title="Donation History"
        emptyMessage="No donations yet"
        donations={contact.donations}
      />
    </div>
  );
}

function DonationTable({
  title,
  emptyMessage,
  donations,
  amountSuffix = "",
  className = "",
}: {
  title: string;
  emptyMessage: string;
  donations: Pick<
    ContactDonation,
    "id" | "form_id" | "form_title" | "amount" | "created_at"
  >[];
  amountSuffix?: string;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {donations.length === 0 ? (
        <div className="p-6 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="px-4 py-3 font-medium">Form</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.id} className="border-b last:border-0 text-sm">
                <td className="px-4 py-3">
                  <Link
                    href={`/forms/${donation.form_id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {donation.form_title}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium">
                  ${(donation.amount / 100).toFixed(2)}
                  {amountSuffix && (
                    <span className="font-normal text-gray-500">
                      {amountSuffix}
                    </span>
                  )}
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
  );
}
