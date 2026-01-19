type ElementName<Name extends string> = `my-${Name}`;

export function prefixedElementName<Name extends string>(
  string: Name,
) {
  return `my-${string}` satisfies ElementName<Name>;
}
