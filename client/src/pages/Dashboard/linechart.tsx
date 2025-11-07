/* eslint-disable no-var */
import React from "react";
import { Line } from "react-chartjs-2";

const LineCharts = () => {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September","October"],
      datasets: [
        {
            label: "Project Analytics",
            fill: true,
            lineTension: 0.5,
            backgroundColor: "rgba(8, 9, 13, 0.57)",
            borderColor: "#9E8959",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "#9E8959",
            pointBackgroundColor: "#fff", //3
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#9E8959",
            pointHoverBorderColor: "#fff", //5
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [10, 20,30,40,50,60,70,80,90]
        }
       
    ]
  };
  var option = {
    scales: {
      yAxes: [
        {
          ticks: {
            max: 100,
            min: 10,
            stepSize: 10,
          },
        },
      ],
    },
  };

  return <Line width={500} height={250} data={data} options={option} />;
};

export default LineCharts;