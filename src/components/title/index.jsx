const TitleOfThePage = ({ title, definition }) => {
  return (
    <div className="space-y-1">
      <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100 sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      <p className="font-mono-cyber text-sm text-slate-500 tracking-widest">
        {definition}
      </p>
    </div>
  );
};

export default TitleOfThePage;
