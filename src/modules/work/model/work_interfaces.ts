interface WorkCreateProps {
  userId: string;
  name: string;
  description: string;
  price: number;
};

interface WorkDeleteProps {
  id: string;
};

interface WorkGetOneProps {
  userId?: string;
  name?: string;
  description?: string;
  price?: number;
}

interface WorkUpdateProps {
  id: string;
  name: string;
  description: string;
  price: number;
}

export { WorkCreateProps, WorkDeleteProps, WorkGetOneProps, WorkUpdateProps };
