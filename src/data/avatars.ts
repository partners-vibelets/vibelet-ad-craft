// Avatar data with video previews
export interface AvatarOption {
  id: string;
  name: string;
  style: string;
  imageUrl: string;
  videoPreviewUrl: string;
  gender: 'female' | 'male' | 'neutral';
}

export const AVATARS: AvatarOption[] = [
  {
    id: 'emma',
    name: 'Emma',
    style: 'Friendly & Approachable',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'female',
  },
  {
    id: 'james',
    name: 'James',
    style: 'Professional & Confident',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'male',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    style: 'Energetic & Enthusiastic',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'female',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    style: 'Calm & Authoritative',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'male',
  },
  {
    id: 'aria',
    name: 'Aria',
    style: 'Warm & Conversational',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'female',
  },
  {
    id: 'alex',
    name: 'Alex',
    style: 'Modern & Casual',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'male',
  },
  {
    id: 'maya',
    name: 'Maya',
    style: 'Inspiring & Dynamic',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'female',
  },
  {
    id: 'daniel',
    name: 'Daniel',
    style: 'Trustworthy & Reliable',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
    videoPreviewUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
    gender: 'male',
  },
];

export const getAvatarById = (id: string): AvatarOption | undefined => {
  return AVATARS.find(a => a.id === id);
};
