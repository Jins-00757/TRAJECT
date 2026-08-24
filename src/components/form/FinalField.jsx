import { useField } from "react-final-form";

export function FinalField({ name, component: Component, validate, ...rest }) {
  const { input, meta } = useField(name, { validate });
  const showError = (meta.touched || meta.submitFailed) && meta.error;

  return (
    <Component
      {...rest}
      name={input.name}
      value={input.value}
      onChange={input.onChange}
      onBlur={input.onBlur}
      onFocus={input.onFocus}
      error={showError ? meta.error : null}
    />
  );
}