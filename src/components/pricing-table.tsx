import Link from "next/link";
import { ADD_ON_IDS, ADD_ONS, EVERY_ORDER_INCLUDES, SERVICES, type ServiceId } from "@/config/services";
import { addOnPriceLabel, formatUSD } from "@/lib/pricing";

export function ServicePriceTable({ serviceIds }: { serviceIds: ServiceId[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full text-left">
        <caption className="sr-only">Services, prices and delivery times</caption>
        <thead className="border-b border-line text-sm text-muted">
          <tr>
            <th scope="col" className="p-4 font-medium">Service</th>
            <th scope="col" className="p-4 font-medium">Price</th>
            <th scope="col" className="p-4 font-medium">Delivery</th>
            <th scope="col" className="p-4 font-medium"><span className="sr-only">Order</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {serviceIds.map((id) => {
            const s = SERVICES[id];
            return (
              <tr key={id}>
                <th scope="row" className="p-4 align-top font-normal">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-sm text-muted">{s.examples}</span>
                </th>
                <td className="p-4 align-top text-lg font-semibold">{formatUSD(s.priceCents)}</td>
                <td className="p-4 align-top">{s.deliveryBusinessDays} business days</td>
                <td className="p-4 align-top">
                  <Link href={`/order?service=${id}`} className="whitespace-nowrap font-medium text-accent underline">
                    Order<span className="sr-only"> a {s.name.toLowerCase()}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AddOnTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full text-left">
        <caption className="sr-only">Optional add-ons</caption>
        <thead className="border-b border-line text-sm text-muted">
          <tr>
            <th scope="col" className="p-4 font-medium">Add-on</th>
            <th scope="col" className="p-4 font-medium">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {ADD_ON_IDS.map((id) => (
            <tr key={id}>
              <th scope="row" className="p-4 align-top font-normal">
                <span className="block font-semibold">{ADD_ONS[id].name}</span>
                <span className="block text-sm text-muted">{ADD_ONS[id].description}</span>
              </th>
              <td className="whitespace-nowrap p-4 align-top font-semibold">{addOnPriceLabel(id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IncludedList() {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {EVERY_ORDER_INCLUDES.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="text-accent">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
