import { buildModuleSelection, MODULE_CATALOG } from '../data/moduleCatalog';

export async function startModuleCheckout({
  token,
  slug,
  navigate,
  userApi,
  catalog = MODULE_CATALOG,
  addCounselling: addCounsellingOverride,
}) {
  const mod = catalog.find((m) => m.slug === slug);
  const addCouns = addCounsellingOverride ?? !!(mod?.optionalCounselling);
  const selection = buildModuleSelection(slug, addCouns, catalog);
  if (!selection) throw new Error('Program not available for booking');

  const res = await userApi.bookAssessment(token, {
    productSlug: slug,
    addCounselling: selection.addCounselling,
    amount: selection.total,
    lineItems: selection.lineItems,
    selectionTitle: selection.displayTitle,
  });

  navigate(`/payment/${res.assessment.id}`, { state: { selection } });
  return res;
}
