const PINCODE_REGEX = /^\d{6}$/;
const HYBRID_REGEX = /^([^,]+?)[\s,-]+(\d{6})$/;

const collapseWhitespace = (value = "") => value.replace(/\s+/g, " ").trim();

export const capitalizeWords = (value = "") => {
  const condensed = collapseWhitespace(value);
  if (!condensed) return "";
  return condensed.toLowerCase().replace(/\b([a-z])/g, (char) => char.toUpperCase());
};

const normalizeNameCandidate = (value = "") => {
  if (!value) return "";
  const withoutPostal = value.replace(/[-_/]/g, " ").replace(/\d{3,}/g, " ");
  const condensed = collapseWhitespace(withoutPostal);
  return capitalizeWords(condensed);
};

const gatherLocationCandidates = (destination = {}) => {
  const location = destination.location || {};
  return [
    destination.displayName,
    destination.name,
    location.name,
    location.city,
    location.town,
    location.district,
    location.state,
    location.county,
    location.region,
    location.area,
    location.suburb,
    location.village,
  ]
    .map(normalizeNameCandidate)
    .filter(Boolean);
};

export const parseDestinationSearchInput = (raw = "") => {
  const trimmed = collapseWhitespace(raw);
  if (!trimmed) {
    return {
      original: raw,
      trimmed: "",
      lookupQuery: "",
      label: "",
      postalCode: "",
      hasPostalCode: false,
    };
  }

  const hybridMatch = trimmed.match(HYBRID_REGEX);
  if (hybridMatch) {
    const labelRaw = collapseWhitespace(hybridMatch[1].replace(/[-_]/g, " "));
    const postalCode = hybridMatch[2];
    const label = capitalizeWords(labelRaw);
    const lookupQuery = collapseWhitespace(`${label} ${postalCode}`);
    return {
      original: raw,
      trimmed,
      lookupQuery,
      label,
      postalCode,
      hasPostalCode: true,
    };
  }

  const isPostal = PINCODE_REGEX.test(trimmed);
  return {
    original: raw,
    trimmed,
    lookupQuery: trimmed,
    label: isPostal ? "" : capitalizeWords(trimmed),
    postalCode: isPostal ? trimmed : "",
    hasPostalCode: isPostal,
  };
};

export const buildDestinationDisplayName = (destination = {}, context = {}) => {
  const contextCandidates = [];
  if (context.label) {
    contextCandidates.push(normalizeNameCandidate(context.label));
  }
  const locationCandidates = gatherLocationCandidates(destination);
  const destinationCandidates = [...contextCandidates, ...locationCandidates];
  const firstWithLetters = destinationCandidates.find((candidate) => /[A-Za-z]/.test(candidate));
  if (firstWithLetters) return firstWithLetters;

  if (context.label && /[A-Za-z]/.test(context.label)) {
    return normalizeNameCandidate(context.label);
  }
  if (destination.name && /[A-Za-z]/.test(destination.name)) {
    return normalizeNameCandidate(destination.name);
  }
  if (context.trimmed && /[A-Za-z]/.test(context.trimmed)) {
    return normalizeNameCandidate(context.trimmed);
  }
  if (context.postalCode) return context.postalCode;
  return context.lookupQuery || context.original || "Destination";
};

export const enhanceDestinationWithSearchContext = (destination, context = {}) => {
  if (!destination) return null;
  const parsedContext = {
    ...parseDestinationSearchInput(context.trimmed ?? context.original ?? ""),
    ...context,
  };

  const location = destination.location ? { ...destination.location } : {};
  const displayName = buildDestinationDisplayName(destination, parsedContext);

  const postalCode =
    parsedContext.postalCode ||
    destination.postalCode ||
    location.postalCode ||
    location.zip ||
    location.postcode ||
    "";

  if (postalCode) {
    location.postalCode = postalCode;
  }

  const badgeParts = [];
  if (postalCode) badgeParts.push(postalCode);
  if (location.state) badgeParts.push(location.state);

  return {
    ...destination,
    name: displayName,
    displayName,
    location,
    searchMetadata: {
      original: parsedContext.original,
      trimmed: parsedContext.trimmed,
      lookupQuery: parsedContext.lookupQuery,
      label: parsedContext.label,
      postalCode,
      hasPostalCode: Boolean(postalCode),
      badge: badgeParts.join(" · ") || "",
    },
  };
};
