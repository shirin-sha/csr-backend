interface DashboardProps {
    id : number;
    title : string;
    price : number;
    isDoller : boolean;
    colorChange:boolean,
    postFix : string;
    statusColor : string;
    series : Array<any>;
}

const WidgetsData : Array<DashboardProps> = [
    {
        id: 1,
        title: "Sponsors",
        price: 50,
        isDoller: false,
        postFix: "",
        colorChange:false,
        statusColor: "success",
        series: [2, 10, 18, 22, 36, 15, 47, 75, 65, 19, 14, 2, 47, 42, 15],
    },
    {
        id: 2,
        title: "Applicants",
        price: 120,
        postFix: "",
        colorChange:true,
        isDoller: false,
        statusColor: "danger",
        series: [15, 42, 47, 2, 14, 19, 65, 75, 47, 15, 42, 47, 2, 14, 12,]
    },
    {
        id: 3,
        title: "Organizers",
        price: 45,
        isDoller: false,
        colorChange:false,
        postFix: "",
        statusColor: "success",
        series: [47, 15, 2, 67, 22, 20, 36, 60, 60, 30, 50, 11, 12, 3, 8,]
    },
    {
        id: 3,
        title: "Sample",
        price: 10,
        isDoller: false,
        colorChange:true,
        postFix: "",
        statusColor: "success",
        series: [47, 15, 2, 67, 22, 20, 36, 60, 60, 30, 50, 11, 12, 3, 8,]
    },
    
];

export { WidgetsData };