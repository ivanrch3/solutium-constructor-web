import { Project } from '../types/schema';
import { Asset } from '../types/asset';
import { getSupabase } from './supabaseClient';
import { uploadToDO } from './doService';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import * as xlsx from 'xlsx';
import { getBrandingStyles } from './brandingService';
import React from 'react';

export const generateAsset = async (
  type: 'pdf' | 'excel' | 'web',
  data: any,
  project: Project,
  userId: string
): Promise<Asset | null> => {
  try {
    const supabase = getSupabase();
    const branding = getBrandingStyles(project);
    
    let url: string | undefined = undefined;
    let assetData: any = null;

    if (type === 'pdf') {
      // Generate PDF
      const styles = StyleSheet.create({
        page: { padding: 30 },
        title: { fontSize: 24, color: branding.primaryColor, marginBottom: 20 },
        text: { fontSize: 12, marginBottom: 10 }
      });

      const MyDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <View>
              <Text style={styles.title}>{project.name} - Report</Text>
              <Text style={styles.text}>{JSON.stringify(data)}</Text>
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(<MyDocument />).toBlob();
      const fileName = `assets/${project.id}/${Date.now()}.pdf`;
      url = await uploadToDO(fileName, blob, 'application/pdf');
      
    } else if (type === 'excel') {
      // Generate Excel
      const worksheet = xlsx.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Data");
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `assets/${project.id}/${Date.now()}.xlsx`;
      url = await uploadToDO(fileName, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    } else if (type === 'web') {
      // Web asset
      assetData = {
        structure: data,
        branding
      };
    }

    // Register in Supabase
    const { data: dbAsset, error } = await supabase
      .from('assets')
      .insert({
        project_id: project.id,
        type,
        name: `${type.toUpperCase()} Asset - ${new Date().toISOString()}`,
        url,
        data: assetData,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: dbAsset.id,
      projectId: dbAsset.project_id,
      type: dbAsset.type,
      name: dbAsset.name,
      url: dbAsset.url,
      data: dbAsset.data,
      createdAt: dbAsset.created_at
    };

  } catch (error) {
    console.error('Error generating asset:', error);
    return null;
  }
};
