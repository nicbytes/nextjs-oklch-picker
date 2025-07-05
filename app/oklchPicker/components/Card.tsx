function Card({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative outline dark:outline-0 outline-neutral-400/50 dark:bg-[#2D2D2D] rounded-3xl flex flex-col justify-center items-center w-auto m-4 box-content">
        {children}
      </div>
    </>
  );
}

export default Card;