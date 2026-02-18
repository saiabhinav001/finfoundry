interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({ children, className = "", id }: SectionWrapperProps) {
  return (
    <section id={id} className={`section-padding ${className}`}>
      <div className="container-max">{children}</div>
    </section>
  );
}
