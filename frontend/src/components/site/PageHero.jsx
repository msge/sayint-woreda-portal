import React from 'react';

const PageHero = ({ title, subtitle, actions }) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/10 via-white to-secondary/10 p-6 md:p-10 shadow-sm">
      <div className="absolute -top-14 -right-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
};

export default PageHero;
