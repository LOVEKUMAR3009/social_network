from django.contrib import admin
from .models import PostLike, Post

@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'reaction', 'created_at')
    list_filter = ('reaction', 'created_at')
    search_fields = ('user__email', 'post__id')
    readonly_fields = ('created_at',)

# if you also have Post admin
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'description', 'created_at')
    search_fields = ('user__email', 'description')
    readonly_fields = ('created_at',)
