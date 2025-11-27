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
    professor?: Professor;
    roomId: string;
    room?: Room;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
};