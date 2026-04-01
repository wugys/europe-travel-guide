/**
 * Trip Basic Information
 * 行程基本資訊
 */

const TRIP_INFO = {
    name: "奧捷斯匈四國之旅",
    subtitle: "國王湖遊船．四國首都．維也納．布拉格．布達佩斯．庫倫洛夫．哈修塔特湖區",
    startDate: "2026-04-01",
    endDate: "2026-04-10",
    duration: "10天",
    leader: {
        name: "林孜璟",
        phone: "+886 913573121"
    },
    travelers: [],
    countries: ["匈牙利", "斯洛伐克", "奧地利", "捷克", "德國"],
    cities: ["布達佩斯", "布拉提斯拉瓦", "維也納", "布爾諾", "布拉格", "庫倫洛夫", "薩爾斯堡", "哈修塔特"]
};

const FLIGHT_INFO = {
    outbound: [
        {
            flight: "MU5006",
            date: "2026/04/01(三)",
            depTime: "18:40",
            depAirport: "桃園機場",
            arrTime: "20:40",
            arrAirport: "上海浦東機場",
            duration: "02:00"
        },
        {
            flight: "FM869",
            date: "2026/04/02(四)",
            depTime: "01:50",
            depAirport: "上海浦東機場",
            arrTime: "08:05",
            arrAirport: "布達佩斯機場",
            duration: "12:15"
        }
    ],
    return: [
        {
            flight: "FM870",
            date: "2026/04/09(四)",
            depTime: "12:30",
            depAirport: "布達佩斯機場",
            arrTime: "05:35(+1)",
            arrAirport: "上海浦東機場",
            duration: "11:05"
        },
        {
            flight: "MU5007",
            date: "2026/04/10(五)",
            depTime: "12:20",
            depAirport: "上海浦東機場",
            arrTime: "14:25",
            arrAirport: "桃園機場",
            duration: "02:05"
        }
    ]
};
