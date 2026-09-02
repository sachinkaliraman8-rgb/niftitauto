import type { Metadata } from "next";
import { getAllPlans } from "@/lib/plans";
import { createPlan, updatePlan, deletePlan } from "./actions";

export const metadata: Metadata = { title: "Manage plans" };

export default async function AdminPlansPage() {
  const plans = await getAllPlans();

  return (
    <div>
      <div className="page-head">
        <h2>Plans</h2>
        <p>Create, edit, and retire the plans customers can buy.</p>
      </div>

      <details className="card" style={{ marginBottom: 28 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>+ Add a new plan</summary>
        <form action={createPlan} style={{ marginTop: 20 }}>
          <PlanFields />
          <button type="submit" className="btn btn-fill" style={{ marginTop: 8 }}>
            Create plan
          </button>
        </form>
      </details>

      {plans.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">No plans yet — add one above.</div>
        </div>
      ) : (
        <div className="section-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Interval</th>
                <th>Days</th>
                <th>Active</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>₹{plan.price_inr.toLocaleString("en-IN")}</td>
                  <td>{plan.billing_interval}</td>
                  <td>{plan.duration_days}</td>
                  <td>
                    <span className={`badge ${plan.is_active ? "badge-active" : "badge-cancelled"}`}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{plan.is_featured ? "Yes" : "—"}</td>
                  <td>
                    <details>
                      <summary style={{ cursor: "pointer", fontSize: 13.5, color: "var(--jade)", fontWeight: 600 }}>
                        Edit
                      </summary>
                      <form action={updatePlan} style={{ marginTop: 14, minWidth: 280 }}>
                        <input type="hidden" name="id" value={plan.id} />
                        <PlanFields plan={plan} />
                        <button type="submit" className="btn btn-fill btn-sm" style={{ marginTop: 8 }}>
                          Save
                        </button>
                      </form>
                      <form action={deletePlan} style={{ marginTop: 10 }}>
                        <input type="hidden" name="id" value={plan.id} />
                        <button type="submit" className="btn btn-line btn-sm">
                          Delete
                        </button>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type PlanDefaults = {
  name: string;
  price_inr: number;
  billing_interval: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

function PlanFields({ plan }: { plan?: PlanDefaults }) {
  return (
    <>
      <div className="field">
        <label>Name</label>
        <input name="name" required defaultValue={plan?.name} />
      </div>
      <div className="field">
        <label>Price (INR)</label>
        <input name="price_inr" type="number" step="0.01" required defaultValue={plan?.price_inr} />
      </div>
      <div className="field">
        <label>Billing interval</label>
        <select
          name="billing_interval"
          defaultValue={plan?.billing_interval ?? "monthly"}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid var(--hair)",
            fontSize: 15,
            fontFamily: "inherit",
            background: "var(--paper)",
          }}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="field">
        <label>Duration (days)</label>
        <input name="duration_days" type="number" required defaultValue={plan?.duration_days ?? 30} />
      </div>
      <div className="field">
        <label>Features (one per line)</label>
        <textarea
          name="features"
          rows={4}
          defaultValue={plan?.features?.join("\n")}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid var(--hair)",
            fontSize: 15,
            fontFamily: "inherit",
            background: "var(--paper)",
          }}
        />
      </div>
      <div className="field">
        <label>Sort order</label>
        <input name="sort_order" type="number" defaultValue={plan?.sort_order ?? 0} />
      </div>
      <div className="field" style={{ display: "flex", gap: 20 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="is_active" defaultChecked={plan?.is_active ?? true} />
          Active
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="is_featured" defaultChecked={plan?.is_featured ?? false} />
          Featured
        </label>
      </div>
    </>
  );
}
