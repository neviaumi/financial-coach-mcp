type ElementName<Name extends string> = `my-${Name}`;

export default function prefixedElement<Name extends string>(
  string: Name,
) {
  return `my-${string}` satisfies ElementName<Name>;
}
