from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'extracted_text', 'skills']

    def validate(self, attrs):
        file_type = attrs.get('file_type')
        file = attrs.get('file')
        raw_text = attrs.get('raw_text')

        if file_type in ['pdf', 'docx'] and not file:
            raise serializers.ValidationError("PDF veya DOCX için dosya yüklemelisiniz.")

        if file_type == 'text' and not raw_text:
            raise serializers.ValidationError("Text tipi için raw_text alanı zorunludur.")

        return attrs