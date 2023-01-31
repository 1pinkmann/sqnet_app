export default function ChartSideItem({ color, option }) {
  return (
    <>
      <div className="flex w-100 vertical-center">
        <div
          style={{
            background: color,
            width: "36px",
            height: "2.5px",
            borderRadius: "3px",
            borderCollapse: "separate",
            overflow: "hidden",
          }}
        ></div>
        <span
          style={{
            marginLeft: "12px",
            fontSize: "14px",
            fontWeight: "500",
            marginRight: "auto",
          }}
        >
          {option.currency}
        </span>
        {/* <span style={{marginLeft: '8px', color: '#58667e'}}>
                {option.symbol}
            </span> */}
      </div>
    </>
  );
}
