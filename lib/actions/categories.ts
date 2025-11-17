'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase/admin';
import { COLORS_PALETTE } from '@/lib/constants';
import type { Category, User } from '@/types';

/**
 * Add a new category
 */
export async function addCategory(name: string) {
  try {
    if (!name || name.trim() === '') {
      return { success: false, error: 'Category name is required' };
    }

    // Get current categories count for color selection
    const categoriesSnapshot = await adminDb.collection('categories').get();
    const colorIndex = categoriesSnapshot.size % COLORS_PALETTE.length;

    const newCategoryId = `cat_${Date.now()}`;
    const categoryRef = adminDb.collection('categories').doc(newCategoryId);

    await categoryRef.set({
      name: name.trim(),
      color: COLORS_PALETTE[colorIndex],
      users: [],
      createdAt: new Date(),
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, categoryId: newCategoryId };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, error: 'Failed to add category' };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string) {
  try {
    await adminDb.collection('categories').doc(categoryId).delete();

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

/**
 * Add a user to a category
 */
export async function addUserToCategory(categoryId: string, userName: string) {
  try {
    if (!userName || userName.trim() === '') {
      return { success: false, error: 'User name is required' };
    }

    const categoryRef = adminDb.collection('categories').doc(categoryId);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return { success: false, error: 'Category not found' };
    }

    const categoryData = categoryDoc.data() as Category;
    const users = categoryData.users || [];

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userName.trim(),
    };

    users.push(newUser);

    await categoryRef.update({ users });

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, error: 'Failed to add user' };
  }
}

/**
 * Delete a user from a category
 */
export async function deleteUserFromCategory(categoryId: string, userId: string) {
  try {
    const categoryRef = adminDb.collection('categories').doc(categoryId);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return { success: false, error: 'Category not found' };
    }

    const categoryData = categoryDoc.data() as Category;
    const users = (categoryData.users || []).filter((u) => u.id !== userId);

    await categoryRef.update({ users });

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
