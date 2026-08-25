// src/components/companies/CompanyLogo.jsx
import { Avatar } from "@mantine/core";

export default function CompanyLogo({ company, size = 36 }) {
  return (
    <Avatar
      src={company?.logo}
      name={company?.name}
      color="initials"
      radius="xl"
      size={size}
      alt=""
    />
  );
}
