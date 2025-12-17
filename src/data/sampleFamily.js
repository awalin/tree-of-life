// Sample family tree data
export const sampleFamilyData = {
  id: "1",
  name: "Margaret Thompson",
  birth: "1920",
  death: "2005",
  gender: "female",
  children: [
    {
      id: "2",
      name: "Robert Thompson",
      birth: "1945",
      gender: "male",
      children: [
        {
          id: "5",
          name: "Sarah Thompson",
          birth: "1970",
          gender: "female",
          children: [
            {
              id: "9",
              name: "Emma Wilson",
              birth: "1995",
              gender: "female",
              children: []
            },
            {
              id: "10",
              name: "James Wilson",
              birth: "1998",
              gender: "male",
              children: []
            }
          ]
        },
        {
          id: "6",
          name: "Michael Thompson",
          birth: "1973",
          gender: "male",
          children: [
            {
              id: "11",
              name: "Olivia Thompson",
              birth: "2001",
              gender: "female",
              children: []
            }
          ]
        }
      ]
    },
    {
      id: "3",
      name: "Elizabeth Davis",
      birth: "1948",
      gender: "female",
      children: [
        {
          id: "7",
          name: "Jennifer Davis",
          birth: "1975",
          gender: "female",
          children: [
            {
              id: "12",
              name: "Lucas Martinez",
              birth: "2003",
              gender: "male",
              children: []
            }
          ]
        }
      ]
    },
    {
      id: "4",
      name: "William Thompson",
      birth: "1952",
      death: "2018",
      gender: "male",
      children: [
        {
          id: "8",
          name: "David Thompson",
          birth: "1980",
          gender: "male",
          children: [
            {
              id: "13",
              name: "Sophia Thompson",
              birth: "2008",
              gender: "female",
              children: []
            },
            {
              id: "14",
              name: "Noah Thompson",
              birth: "2010",
              gender: "male",
              children: []
            }
          ]
        }
      ]
    }
  ]
};

// Generate unique ID for new nodes
export const generateId = () => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

