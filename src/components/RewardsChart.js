import React, { useCallback, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";

import logo from "../assets/images/graph-logo.png";

const RewardsChart = (props) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartData, setChartData] = useState([]);

  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  useEffect(() => {
    if (props.chartData.length) {
      if (props.total >= 100) {
        let newData = JSON.parse(JSON.stringify(props.chartData));
        newData.push({
          name: "",
          value: 0,
          fill: "#29125D",
        });
        setChartData(newData.filter((el) => el.value !== 0));
      } else if (props.total < 100 && props.total !== 0) {
        let newData = JSON.parse(JSON.stringify(props.chartData));
        newData.push({
          name: "",
          value: 100 - props.total,
          fill: "#29125D",
        });
        setChartData(newData.filter((el) => el.value !== 0));
      }
    }
  }, [JSON.stringify(props.chartData)]);

  useEffect(() => {
    if (!props.chartData.length) {
      if (props.total === 0) {
        let newData = [];
        newData.push({
          name: "",
          value: 100,
          fill: "#29125D",
        });
        setChartData(newData);
      }
    } else {
      if (props.total === 0) {
        let newData = [];
        newData.push({
          name: "",
          value: 100,
          fill: "#29125D",
        });
        setChartData(newData);
      }
    }
  }, [props.total]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if (payload[0].name) {
        let image = `./images/${payload[0].name.toLowerCase()}-logo.png`;
        return (
          <div className="custom-tooltip">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>
                <img
                  src={image}
                  style={{
                    maxWidth: "22px",
                    maxHeight: "100%",
                    marginRight: 5,
                    marginLeft: 2,
                  }}
                />
              </span>
              <span style={{ display: "flex" }}>{payload[0].name}</span>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={props.name ? outerRadius + 8 : outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ cursor: "pointer" }}
        />
      </g>
    );
  };

  const renderLabel = ({ viewBox }) => {
    return (
      <g>
        <foreignObject
          x={viewBox.cx - 38}
          y={viewBox.cy - 38}
          width={80}
          height={80}
        >
          <img src={logo} style={{ maxHeight: "80px", maxWidth: "80px" }} />
        </foreignObject>
      </g>
    );
  };

  return (
    <div>
      <ResponsiveContainer minHeight={185} width="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            innerRadius={68}
            outerRadius={84}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            stroke="none"
            onMouseEnter={onPieEnter}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ cursor: "pointer" }}
          >
            <Label content={renderLabel} position="center" />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {props.chartData.length ? (
        <div className="detail-comp pb-2 mb-4 mb-md-0 mt-md-0 mt-3 row">
          {props.chartData.map((item, index) => {
            let length = props.chartData.length;
            return (
              <div
                key={`chart-data-${index}`}
                style={
                  length === 1
                    ? { width: "100%", border: "none" }
                    : length === 2
                      ? index === 1
                        ? { width: "50%", border: "none" }
                        : { width: "50%" }
                      : length === 3
                        ? { width: "33%" }
                        : length === 4 && index !== 3
                          ? { width: "33%" }
                          : length === 4 && index === 3
                            ? { width: "100%", border: "none" }
                            : length === 5 && index === 4
                              ? { width: "50%", border: "none" }
                              : length === 5 && index === 3
                                ? { width: "50%" }
                                : length === 5 && index !== 3 && index !== 4
                                  ? { width: "33%" }
                                  : { width: "33%" }
                }
              >
                <div
                  className="color-circle"
                  style={{ borderColor: item.fill }}
                ></div>
                <div>{item.name}</div>
              </div>
            );
          })}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default RewardsChart;
