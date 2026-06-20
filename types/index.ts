export type PickerProject = {
  id: string;
  name: string;
  color: string;
  status: string;
};

export type RecentPrompt = {
  id: string;
  title: string;
  slug: string;
  category: string;
  promptText: string;
};

export type LinkablePrompt = {
  id: string;
  title: string;
  category: string;
  promptText: string;
};
