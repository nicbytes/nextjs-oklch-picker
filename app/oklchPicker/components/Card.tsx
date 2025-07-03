function Card({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-[#2D2D2D] rounded-3xl flex flex-col justify-center items-center w-auto m-4 py-6 box-content">
        {children}
      </div>
    </>
  );
}

export default Card;