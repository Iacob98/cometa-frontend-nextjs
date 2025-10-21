import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { work_entry_id, filename, file_path, photo_type, is_before_photo, is_after_photo } = body;

    if (!work_entry_id || !filename || !file_path) {
      return NextResponse.json(
        { error: 'work_entry_id, filename, and file_path are required' },
        { status: 400 }
      );
    }

    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        work_entry_id,
        filename,
        file_path,
        photo_type: photo_type || 'general',
        is_before_photo: is_before_photo || false,
        is_after_photo: is_after_photo || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase photo insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save photo metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Photo API error:', error);
    return NextResponse.json(
      { error: 'Failed to save photo' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const work_entry_id = searchParams.get('work_entry_id');

    if (!work_entry_id) {
      return NextResponse.json(
        { error: 'work_entry_id is required' },
        { status: 400 }
      );
    }

    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('work_entry_id', work_entry_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase photos fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }

    // Get public URLs for photos
    const photosWithUrls = photos.map(photo => {
      if (photo.file_path) {
        const { data } = supabase.storage
          .from('work-photos')
          .getPublicUrl(photo.file_path);
        return {
          ...photo,
          url: data.publicUrl
        };
      }
      return photo;
    });

    return NextResponse.json(photosWithUrls);
  } catch (error) {
    console.error('Photos GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
