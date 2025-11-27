export type Professor = {
    id: string;
    name: string;
    academicDegree?: string;
    expertiseArea?: string;
};

export type Room = {
    id: string;
    code: string;
    capacity: number;
    roomType: string;
    status: string;
    floor: number;
    buildingId?: string;
    imageUrl?: string;
};

export type Lecture = {
    id: string;
    subjectName: string;
    professorId: string;
    date: {value:string}
    professor?: Professor;
    roomId: string;
    endDate: string
    room?: Room;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
};