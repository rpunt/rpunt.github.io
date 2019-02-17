---
layout: post
---

<div class="posts">
  {% for post in site.posts %}
    {%- assign lazyload = true -%}

    {%- if forloop.first == true -%}
      {%- assign lazyload = false -%}
    {%- endif -%}

    <div class="post">
      <h3 class="post-title">
        <a href="{{ post.url }}">
          {{ post.title }}
        </a>
      </h3>

      <span class="post-date">{{ post.date | date_to_string }}</span>

      {% if post.video %}
      {%- include video.html do_lazyload=lazyload -%}
      {% endif %}

      {{ post.content }}
    </div>
  {% endfor %}
</div>
